<?php

use Symfony\Component\VarDumper\VarDumper;
use Tinkerpad\Php\Exceptions\DieException;
use Symfony\Component\VarDumper\Caster\ScalarStub;

function dd(mixed ...$vars): never
{
    if (! $vars) {
        VarDumper::dump(new ScalarStub('🐛'));

        throw new DieException;
    }

    if (array_key_exists(0, $vars) && count($vars) === 1) {
        VarDumper::dump($vars[0]);
    } else {
        foreach ($vars as $k => $v) {
            VarDumper::dump($v, is_int($k) ? 1 + $k : $k);
        }
    }

    throw new DieException;
}

function dump(mixed ...$vars): void
{
    if (! $vars) {
        VarDumper::dump(new ScalarStub('🐛'));

        return;
    }

    if (array_key_exists(0, $vars) && count($vars) === 1) {
        VarDumper::dump($vars[0]);
        $k = 0;
    } else {
        foreach ($vars as $k => $v) {
            VarDumper::dump($v, is_int($k) ? 1 + $k : $k);
        }
    }
}