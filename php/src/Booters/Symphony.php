<?php

namespace Tinkerpad\Php\Booters;

class Symphony extends Booter
{
    public static function boot(string $cwd): void
    {
        if (!is_file($cwd . '/symfony.lock') || !is_file($cwd . '/src/Kernel.php')) {
            return;
        }

        require_once $cwd . '/src/Kernel.php';

        (new \App\Kernel())->boot(
            $_SERVER['APP_ENV'] ?? 'dev',
            ($_SERVER['APP_DEBUG'] ?? '1') === '1',
        );

        static::$info = [
            'framework_name' => 'Symfony',
            'framework_version' => \Symfony\Component\HttpKernel\Kernel::VERSION,
            'php_version' => phpversion(),
        ];
    }
}