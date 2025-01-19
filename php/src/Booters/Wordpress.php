<?php

namespace Tinkerpad\Php\Booters;

class Wordpress extends Booter
{
    public static function boot(string $cwd): void
    {
        if (!is_file($cwd . '/wp-load.php')) {
            return;
        }

        require_once $cwd . '/wp-load.php';
        require_once $cwd . '/wp-admin/includes/admin.php';
        require_once $cwd . '/wp-includes/pluggable.php';

        try {
            $version = get_bloginfo('version');
        } catch (\Throwable) {
            $version = null;
        }

        static::$info = [
            'framework_name' => 'WordPress',
            'framework_version' => $version,
            'php_version' => phpversion(),
        ];
    }
}