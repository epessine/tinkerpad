<?php

if (is_file($cwd . '/wp-load.php')) {
    require_once $cwd . '/wp-load.php';
    require_once $cwd . '/wp-admin/includes/admin.php';
    require_once $cwd . '/wp-includes/pluggable.php';

    if ($code === null) {
        try {
            $version = get_bloginfo('version');
        } catch (Throwable) {
            $version = null;
        }

        $info = json_encode([
            'framework_name' => 'WordPress',
            'framework_version' => $version,
            'php_version' => phpversion(),
        ]) . PHP_EOL;
    }
}