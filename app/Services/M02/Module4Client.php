<?php

namespace App\Services\M02;

use App\Exceptions\ExternalServiceException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class Module4Client
{
    private string $baseUrl;
    private int $cacheTtl;
    private int $timeout;

    public function __construct()
    {
        $this->baseUrl = config('m02.module4.base_url');
        $this->cacheTtl = config('m02.module4.cache_ttl', 900); // Default 15 minutes
        $this->timeout = config('m02.module4.timeout', 10); // Default 10 seconds
    }

    /**
     * Fetch available license types from Module 4 catalog.
     * Results are cached for 15 minutes.
     *
     * @return Collection
     * @throws ExternalServiceException
     */
    public function getJenisLesen(): Collection
    {
        return Cache::remember('module4:jenis_lesen', $this->cacheTtl, function () {
            try {
                $response = Http::timeout($this->timeout)
                    ->get("{$this->baseUrl}/jenis-lesen");

                if ($response->successful()) {
                    return collect($response->json('data', []));
                }

                // If request fails, throw exception
                throw new ExternalServiceException(
                    'Module 4',
                    "Failed to fetch jenis_lesen: HTTP {$response->status()}"
                );
            } catch (\Illuminate\Http\Client\ConnectionException $e) {
                Log::warning('Module 4 connection failed when fetching jenis_lesen', [
                    'error' => $e->getMessage(),
                    'base_url' => $this->baseUrl,
                ]);

                // Return development fallback if in non-production environment
                if (!app()->environment('production')) {
                    return $this->getJenisLesenFallback();
                }

                throw new ExternalServiceException('Module 4', 'Connection failed', $e);
            } catch (\Exception $e) {
                Log::error('Module 4 error when fetching jenis_lesen', [
                    'error' => $e->getMessage(),
                    'base_url' => $this->baseUrl,
                ]);

                // Return development fallback if in non-production environment
                if (!app()->environment('production')) {
                    return $this->getJenisLesenFallback();
                }

                throw new ExternalServiceException('Module 4', 'Request failed', $e);
            }
        });
    }

    /**
     * Fetch document requirements for a specific license type.
     * Results are cached for 15 minutes per license type.
     *
     * @param int $jenisLesenId
     * @return Collection
     * @throws ExternalServiceException
     */
    public function getKeperluanDokumen(int $jenisLesenId): Collection
    {
        $cacheKey = "module4:keperluan_dokumen:{$jenisLesenId}";

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($jenisLesenId) {
            try {
                $response = Http::timeout($this->timeout)
                    ->get("{$this->baseUrl}/jenis-lesen/{$jenisLesenId}/keperluan-dokumen");

                if ($response->successful()) {
                    return collect($response->json('data', []));
                }

                // If request fails, throw exception
                throw new ExternalServiceException(
                    'Module 4',
                    "Failed to fetch keperluan_dokumen for jenis_lesen_id {$jenisLesenId}: HTTP {$response->status()}"
                );
            } catch (\Illuminate\Http\Client\ConnectionException $e) {
                Log::warning('Module 4 connection failed when fetching keperluan_dokumen', [
                    'error' => $e->getMessage(),
                    'jenis_lesen_id' => $jenisLesenId,
                    'base_url' => $this->baseUrl,
                ]);

                // Return development fallback if in non-production environment
                if (!app()->environment('production')) {
                    return $this->getKeperluanDokumenFallback($jenisLesenId);
                }

                throw new ExternalServiceException('Module 4', 'Connection failed', $e);
            } catch (\Exception $e) {
                Log::error('Module 4 error when fetching keperluan_dokumen', [
                    'error' => $e->getMessage(),
                    'jenis_lesen_id' => $jenisLesenId,
                    'base_url' => $this->baseUrl,
                ]);

                // Return development fallback if in non-production environment
                if (!app()->environment('production')) {
                    return $this->getKeperluanDokumenFallback($jenisLesenId);
                }

                throw new ExternalServiceException('Module 4', 'Request failed', $e);
            }
        });
    }

    /**
     * Validate if a jenis_lesen_id exists in the catalog.
     *
     * @param int $jenisLesenId
     * @return bool
     */
    public function jenisLesenExists(int $jenisLesenId): bool
    {
        try {
            $jenisLesenList = $this->getJenisLesen();
            return $jenisLesenList->contains('id', $jenisLesenId);
        } catch (ExternalServiceException $e) {
            Log::error('Failed to validate jenis_lesen_id', [
                'jenis_lesen_id' => $jenisLesenId,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Development fallback data for jenis_lesen when Module 4 is unavailable.
     *
     * @return Collection
     */
    private function getJenisLesenFallback(): Collection
    {
        Log::info('Using fallback data for jenis_lesen (development mode)');

        return collect([
            [
                'id' => 1,
                'kod' => 'SAMPLE-01',
                'nama' => 'Lesen Perniagaan Makanan',
                'keterangan' => 'License for food business operations',
                'kategori' => 'Berisiko',
                'yuran_proses' => 150.00,
            ],
            [
                'id' => 2,
                'kod' => 'SAMPLE-02',
                'nama' => 'Lesen Kedai Runcit',
                'keterangan' => 'License for retail shop operations',
                'kategori' => 'Tidak Berisiko',
                'yuran_proses' => 100.00,
            ],
            [
                'id' => 3,
                'kod' => 'SAMPLE-03',
                'nama' => 'Lesen Perkhidmatan',
                'keterangan' => 'License for service-based business',
                'kategori' => 'Tidak Berisiko',
                'yuran_proses' => 120.00,
            ],
        ]);
    }

    /**
     * Development fallback data for keperluan_dokumen when Module 4 is unavailable.
     *
     * @param int $jenisLesenId
     * @return Collection
     */
    private function getKeperluanDokumenFallback(int $jenisLesenId): Collection
    {
        Log::info('Using fallback data for keperluan_dokumen (development mode)', [
            'jenis_lesen_id' => $jenisLesenId,
        ]);

        // Fallback data mapped by jenis_lesen_id
        $fallbackData = [
            1 => [
                [
                    'id' => 1,
                    'jenis_lesen_id' => 1,
                    'nama' => 'Salinan Pendaftaran SSM',
                    'keterangan' => 'Copy of SSM registration certificate',
                    'wajib' => true,
                ],
                [
                    'id' => 2,
                    'jenis_lesen_id' => 1,
                    'nama' => 'Gambar Premis Perniagaan',
                    'keterangan' => 'Photos of business premises',
                    'wajib' => true,
                ],
                [
                    'id' => 3,
                    'jenis_lesen_id' => 1,
                    'nama' => 'Sijil Kesihatan',
                    'keterangan' => 'Health certificate for food handlers',
                    'wajib' => true,
                ],
            ],
            2 => [
                [
                    'id' => 4,
                    'jenis_lesen_id' => 2,
                    'nama' => 'Salinan Pendaftaran SSM',
                    'keterangan' => 'Copy of SSM registration certificate',
                    'wajib' => true,
                ],
                [
                    'id' => 5,
                    'jenis_lesen_id' => 2,
                    'nama' => 'Pelan Susun Atur Kedai',
                    'keterangan' => 'Shop layout plan',
                    'wajib' => true,
                ],
            ],
            3 => [
                [
                    'id' => 6,
                    'jenis_lesen_id' => 3,
                    'nama' => 'Salinan Pendaftaran SSM',
                    'keterangan' => 'Copy of SSM registration certificate',
                    'wajib' => true,
                ],
                [
                    'id' => 7,
                    'jenis_lesen_id' => 3,
                    'nama' => 'Sijil Kelayakan',
                    'keterangan' => 'Professional competency certificate',
                    'wajib' => true,
                ],
            ],
        ];

        return collect($fallbackData[$jenisLesenId] ?? []);
    }
}
