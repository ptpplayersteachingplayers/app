<?php
/**
 * Plugin Name: PTP Mobile API
 * Plugin URI: https://ptpsummercamps.com
 * Description: REST API endpoints for the PTP Soccer Camps mobile app
 * Version: 1.1.0
 * Author: Players Teaching Players
 * Author URI: https://ptpsummercamps.com
 * License: GPL v2 or later
 * Text Domain: ptp-mobile-api
 *
 * @package PTP_Mobile_API
 */

if (!defined('ABSPATH')) exit;

define('PTP_MOBILE_API_VERSION', '1.1.0');
define('PTP_MOBILE_API_PATH', plugin_dir_path(__FILE__));

class PTP_Mobile_API {
    private $namespace = 'ptp/v1';
    private $devices_table;

    public function __construct() {
        global $wpdb;
        $this->devices_table = $wpdb->prefix . 'ptp_mobile_devices';
        add_action('rest_api_init', array($this, 'register_routes'));
        register_activation_hook(__FILE__, array($this, 'activate'));
        add_action('rest_api_init', array($this, 'add_cors_headers'));
    }

    public function activate() { $this->create_devices_table(); }

    private function create_devices_table() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();
        $sql = "CREATE TABLE {$this->devices_table} (
            id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id BIGINT(20) UNSIGNED NOT NULL,
            token VARCHAR(255) NOT NULL,
            platform VARCHAR(20) DEFAULT 'unknown',
            updated_at DATETIME NOT NULL,
            PRIMARY KEY (id),
            UNIQUE KEY user_token (user_id, token),
            KEY user_id (user_id)
        ) $charset_collate;";
        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta($sql);
        update_option('ptp_mobile_api_db_version', PTP_MOBILE_API_VERSION);
    }

    public function add_cors_headers() {
        remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
        add_filter('rest_pre_serve_request', function($value) {
            header('Access-Control-Allow-Origin: *');
            header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
            header('Access-Control-Allow-Headers: Authorization, Content-Type');
            return $value;
        });
    }

    public function register_routes() {
        register_rest_route($this->namespace, '/me', array('methods' => 'GET', 'callback' => array($this, 'get_me'), 'permission_callback' => array($this, 'require_login')));
        register_rest_route($this->namespace, '/camps', array('methods' => 'GET', 'callback' => array($this, 'get_camps'), 'permission_callback' => '__return_true'));
        register_rest_route($this->namespace, '/app-config', array('methods' => 'GET', 'callback' => array($this, 'get_app_config'), 'permission_callback' => '__return_true'));
        register_rest_route($this->namespace, '/trainers', array('methods' => 'GET', 'callback' => array($this, 'get_trainers'), 'permission_callback' => '__return_true'));
        register_rest_route($this->namespace, '/sessions', array('methods' => 'GET', 'callback' => array($this, 'get_sessions'), 'permission_callback' => array($this, 'require_login')));
        register_rest_route($this->namespace, '/devices', array('methods' => 'POST', 'callback' => array($this, 'register_device'), 'permission_callback' => array($this, 'require_login')));
    }

    public function require_login() {
        if (!is_user_logged_in()) return new WP_Error('rest_not_logged_in', 'You must be logged in.', array('status' => 401));
        return true;
    }

    public function get_me($request) {
        $user = wp_get_current_user();
        if (!$user->exists()) return new WP_Error('rest_user_not_found', 'User not found.', array('status' => 404));
        $roles = $user->roles;
        return rest_ensure_response(array('id' => $user->ID, 'name' => $user->display_name, 'email' => $user->user_email, 'role' => !empty($roles) ? reset($roles) : 'subscriber'));
    }

    public function get_camps($request) {
        if (!class_exists('WooCommerce')) return new WP_Error('woocommerce_not_active', 'WooCommerce is required.', array('status' => 500));
        $args = array('post_type' => 'product', 'post_status' => 'publish', 'posts_per_page' => 100, 'tax_query' => array(array('taxonomy' => 'product_cat', 'field' => 'slug', 'terms' => array('summer', 'winter-clinics'))));
        $products = get_posts($args);
        $camps = array();
        foreach ($products as $product) {
            $wc_product = wc_get_product($product->ID);
            if (!$wc_product) continue;
            $categories = wp_get_post_terms($product->ID, 'product_cat', array('fields' => 'slugs'));
            $image_id = $wc_product->get_image_id();
            $camps[] = array(
                'id' => $product->ID,
                'name' => $wc_product->get_name(),
                'image' => $image_id ? wp_get_attachment_image_url($image_id, 'medium') : null,
                'price' => '$' . $wc_product->get_price(),
                'date' => get_post_meta($product->ID, '_camp_date', true) ?: '',
                'time' => get_post_meta($product->ID, '_camp_time', true) ?: '',
                'location' => get_post_meta($product->ID, '_camp_location', true) ?: '',
                'state' => get_post_meta($product->ID, '_camp_state', true) ?: '',
                'bestseller' => get_post_meta($product->ID, '_bestseller', true) === 'yes',
                'almost_full' => get_post_meta($product->ID, '_almost_full', true) === 'yes',
                'product_url' => get_permalink($product->ID),
                'description' => $wc_product->get_short_description(),
                'category' => !empty($categories) ? $categories[0] : 'summer',
            );
        }
        return rest_ensure_response($camps);
    }

    public function get_app_config($request) {
        return rest_ensure_response(array(
            'minSupportedAppVersion' => '1.0.0',
            'features' => array('enablePrivateTraining' => true, 'enableMessaging' => true),
            'banners' => array(array('id' => 'winter-clinic', 'title' => 'Winter Clinics Near You', 'body' => '3 hours, 500 touches, no lines.', 'ctaText' => 'Find a Clinic', 'url' => 'https://ptpsummercamps.com/winter')),
        ));
    }

    public function get_trainers($request) {
        if (!post_type_exists('ptp_trainer')) return rest_ensure_response(array());
        $trainers_query = get_posts(array('post_type' => 'ptp_trainer', 'post_status' => 'publish', 'posts_per_page' => 50));
        $trainers = array();
        foreach ($trainers_query as $trainer_post) {
            $photo_id = get_post_thumbnail_id($trainer_post->ID);
            $trainers[] = array(
                'id' => $trainer_post->ID,
                'name' => $trainer_post->post_title,
                'photo' => $photo_id ? wp_get_attachment_image_url($photo_id, 'medium') : null,
                'college' => get_post_meta($trainer_post->ID, '_ptp_college', true) ?: '',
                'bio' => get_post_meta($trainer_post->ID, '_ptp_bio', true) ?: $trainer_post->post_content,
                'city' => get_post_meta($trainer_post->ID, '_ptp_city', true) ?: '',
                'specialty' => get_post_meta($trainer_post->ID, '_ptp_specialty', true) ?: '',
                'rating' => (float)(get_post_meta($trainer_post->ID, '_ptp_avg_rating', true) ?: 0),
            );
        }
        return rest_ensure_response($trainers);
    }

    public function get_sessions($request) {
        $user_id = get_current_user_id();
        $sessions = array();
        if (class_exists('WooCommerce')) {
            $orders = wc_get_orders(array('customer_id' => $user_id, 'status' => array('completed', 'processing', 'on-hold'), 'limit' => 50));
            foreach ($orders as $order) {
                foreach ($order->get_items() as $item) {
                    $product_id = $item->get_product_id();
                    $product = wc_get_product($product_id);
                    if (!$product) continue;
                    $categories = wp_get_post_terms($product_id, 'product_cat', array('fields' => 'slugs'));
                    if (empty(array_intersect($categories, array('summer', 'winter-clinics')))) continue;
                    $camp_date = get_post_meta($product_id, '_camp_date', true);
                    $sessions[] = array(
                        'id' => $item->get_id(),
                        'type' => in_array('winter-clinics', $categories) ? 'clinic' : 'camp',
                        'name' => $product->get_name(),
                        'date' => $camp_date ?: 'TBD',
                        'time' => get_post_meta($product_id, '_camp_time', true) ?: '',
                        'location' => get_post_meta($product_id, '_camp_location', true) ?: '',
                        'status' => ($camp_date && strtotime($camp_date) < time()) ? 'completed' : 'upcoming',
                    );
                }
            }
        }
        return rest_ensure_response($sessions);
    }

    public function register_device($request) {
        global $wpdb;
        $user_id = get_current_user_id();
        $token = sanitize_text_field($request->get_param('token'));
        $platform = sanitize_text_field($request->get_param('platform'));
        $result = $wpdb->replace($this->devices_table, array('user_id' => $user_id, 'token' => $token, 'platform' => $platform, 'updated_at' => current_time('mysql')), array('%d', '%s', '%s', '%s'));
        if ($result === false) return new WP_Error('db_error', 'Failed to register device.', array('status' => 500));
        return rest_ensure_response(array('success' => true));
    }
}

new PTP_Mobile_API();
