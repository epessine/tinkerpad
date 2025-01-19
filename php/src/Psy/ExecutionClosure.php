<?php

namespace Tinkerpad\Php\Psy;

use Psy\ExecutionClosure as PsyExecutionClosure;
use Tinkerpad\Php\Runner;

class ExecutionClosure extends PsyExecutionClosure
{
    public function __construct(Shell $shell)
    {
        $this->setClosure($shell, function () use ($shell) {
            try {
                \extract($shell->getScopeVariables(false));

                \ob_start(function ($cnt) {
                    if (!trim($cnt)) {
                        return '';
                    }
                    
                    Runner::getInstance()->addOutput($cnt);

                    return '';
                });

                \set_error_handler([$shell, 'handleError']);

                $result = eval($shell->onExecute($shell->flushCode() ?: ExecutionClosure::NOOP_INPUT));
            } catch (\Throwable $_e) {
                if (\ob_get_level() > 0) {
                    \ob_end_clean();
                }

                throw $_e;
            } finally {
                \restore_error_handler();
            }

            \ob_end_clean();

            $shell->setScopeVariables(\get_defined_vars());

            return $result;
        });
    }
}
