<?php

if (is_file($cwd . '/vendor/autoload.php')) {
    require_once $cwd . '/vendor/autoload.php';

    if ($code === null) {
        $info = json_encode([
            'framework_name' => 'Composer',
            'php_version' => phpversion(),
        ]);
    }
}