<?php

// autoload_real.php @generated by Composer

class ComposerAutoloaderInite49fb7f6e96c55cc338d1a2640ec8322
{
    private static $loader;

    public static function loadClassLoader($class)
    {
        if ('Composer\Autoload\ClassLoader' === $class) {
            require __DIR__ . '/ClassLoader.php';
        }
    }

    /**
     * @return \Composer\Autoload\ClassLoader
     */
    public static function getLoader()
    {
        if (null !== self::$loader) {
            return self::$loader;
        }

        spl_autoload_register(array('ComposerAutoloaderInite49fb7f6e96c55cc338d1a2640ec8322', 'loadClassLoader'), true, true);
        self::$loader = $loader = new \Composer\Autoload\ClassLoader(\dirname(__DIR__));
        spl_autoload_unregister(array('ComposerAutoloaderInite49fb7f6e96c55cc338d1a2640ec8322', 'loadClassLoader'));

        require __DIR__ . '/autoload_static.php';
        call_user_func(\Composer\Autoload\ComposerStaticInite49fb7f6e96c55cc338d1a2640ec8322::getInitializer($loader));

        $loader->register(true);

        return $loader;
    }
}
