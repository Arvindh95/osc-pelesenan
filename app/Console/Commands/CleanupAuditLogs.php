<?php

namespace App\Console\Commands;

use App\Models\AuditLog;
use Carbon\Carbon;
use Illuminate\Console\Command;

class CleanupAuditLogs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'audit:cleanup {--days=365 : Number of days to retain audit logs}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up old audit logs based on retention policy';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $retentionDays = (int) $this->option('days');
        $cutoffDate = Carbon::now()->subDays($retentionDays);

        $this->info("Cleaning up audit logs older than {$retentionDays} days (before {$cutoffDate->format('Y-m-d H:i:s')})...");

        $deletedCount = AuditLog::where('created_at', '<', $cutoffDate)->delete();

        $this->info("Successfully deleted {$deletedCount} audit log entries.");

        return Command::SUCCESS;
    }
}
