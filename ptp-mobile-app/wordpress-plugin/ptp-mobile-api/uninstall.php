<?php
/**
 * PTP Mobile API - Uninstall
 *
 * @package PTP_Mobile_API
 */

if (!defined('WP_UNINSTALL_PLUGIN')) exit;

global $wpdb;
$table_name = $wpdb->prefix . 'ptp_mobile_devices';
$wpdb->query("DROP TABLE IF EXISTS {$table_name}");
delete_option('ptp_mobile_api_db_version');
