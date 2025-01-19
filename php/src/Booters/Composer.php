<?php

namespace Tinkerpad\Php\Booters;

class Composer extends Booter
{
    public static function boot(string $cwd): void
    {
        if (!is_file($cwd . '/vendor/autoload.php')) {
            return;
        }

        require_once $cwd . '/vendor/autoload.php';

        static::$info = [
            'framework_name' => 'Composer',
            'php_version' => phpversion(),
        ];
    }
}