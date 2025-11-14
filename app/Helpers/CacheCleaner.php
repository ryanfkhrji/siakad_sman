<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;

class CacheCleaner
{
    public static function cleanExceptTokenFlag()
    {
        $flagKey = 'tokens_cleaned_today';

        // Simpan nilai flag sebelum bersihkan
        $flagValue = Cache::get($flagKey);

        // 1. Bersihkan cache file di storage/framework/cache/data
        $cachePath = storage_path('framework/cache/data');
        if (File::exists($cachePath)) {
            File::cleanDirectory($cachePath);
        }

        // 2. Bersihkan cache laravel-excel
        $excelPath = storage_path('framework/laravel-excel');
        if (File::exists($excelPath)) {
            File::cleanDirectory($excelPath);
        }

        // 3. Restore flag token cleanup jika sebelumnya ada
        if ($flagValue) {
            Cache::put($flagKey, $flagValue, now()->endOfDay());
        }
    }
}
