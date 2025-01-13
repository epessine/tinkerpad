<?php

if (is_file($cwd . '/symfony.lock') && is_file($cwd . '/src/Kernel.php')) {
    require_once $cwd . '/src/Kernel.php';

    (new \App\Kernel())->boot(
        $_SERVER['APP_ENV'] ?? 'dev',
        ($_SERVER['APP_DEBUG'] ?? '1') === '1',
    );

    if ($code === null) {
        $info = json_encode([
            'framework_name' => 'Symfony',
            'framework_version' => \Symfony\Component\HttpKernel\Kernel::VERSION,
            'php_version' => phpversion(),
        ]);
    }
}