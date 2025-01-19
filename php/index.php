<?php

use Tinkerpad\Php\Runner;

require 'src/overrides.php';
require 'vendor/autoload.php';

try {
    $runner = (new Runner($argv))->boot();
    
    if ($runner->getCode() === null && $runner->getInfo() !== null) {
        echo json_encode($runner->getInfo());

        return;
    }

    echo json_encode($runner->run()->getOutputs());
} catch (\Throwable $th) {
    echo $th->getMessage();
}
