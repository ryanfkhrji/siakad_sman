<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Helpers\CacheCleaner;

class CacheCleanerController extends Controller
{
    public function triggerCacheCleanup()
    {
        CacheCleaner::cleanExceptTokenFlag();
        return response()->json(['message' => 'Cache berhasil dibersihkan']);
    }
}
