<?php

namespace Tinkerpad\Php\Booters;

abstract class Booter
{
    protected static ?array $info = null;

    protected static array $setups = [];

    abstract public static function boot(string $cwd): void;

    public static function getInfo(): ?array
    {
        return self::$info;
    }

    public static function getSetups(): array
    {
        return self::$setups;
    }
}