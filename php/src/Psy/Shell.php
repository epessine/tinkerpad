<?php

namespace Tinkerpad\Php\Psy;

use Tinkerpad\Php\Runner;
use Psy\Shell as PsyShell;
use Psy\Exception\BreakException;

class Shell extends PsyShell
{
    public function writeException(\Throwable $e)
    {
        if ($e instanceof BreakException) {
            return;
        }
        
        ob_flush();
        Runner::getInstance()->addOutput($e);
    }
}
