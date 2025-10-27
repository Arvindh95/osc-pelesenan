<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Company;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AuditLog>
 */
class AuditLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $entityTypes = ['App\Models\User', 'App\Models\Company'];
        $entityType = fake()->randomElement($entityTypes);
        
        return [
            'actor_id' => User::factory(),
            'action' => fake()->randomElement([
                'user.registered',
                'user.login',
                'user.identity_verified',
                'user.identity_verification_failed',
                'company.verified',
                'company.linked',
                'user.deactivated',
            ]),
            'entity_type' => $entityType,
            'entity_id' => $entityType === 'App\Models\User' ? User::factory() : Company::factory(),
            'meta' => $this->generateMetaData(),
        ];
    }

    /**
     * Generate realistic metadata for audit logs.
     */
    private function generateMetaData(): array
    {
        $metaOptions = [
            [
                'ip_address' => fake()->ipv4(),
                'user_agent' => fake()->userAgent(),
            ],
            [
                'ip_address' => fake()->ipv4(),
                'user_agent' => fake()->userAgent(),
                'verification_method' => fake()->randomElement(['ic_verification', 'ssm_verification']),
            ],
            [
                'ip_address' => fake()->ipv4(),
                'user_agent' => fake()->userAgent(),
                'previous_status' => fake()->randomElement(['active', 'inactive', 'unknown']),
                'new_status' => fake()->randomElement(['active', 'inactive', 'unknown']),
            ],
            [
                'ip_address' => fake()->ipv4(),
                'user_agent' => fake()->userAgent(),
                'reason' => fake()->randomElement(['user_request', 'admin_action', 'system_cleanup']),
            ],
        ];

        return fake()->randomElement($metaOptions);
    }

    /**
     * Create an audit log for user registration.
     */
    public function userRegistration(): static
    {
        return $this->state(fn (array $attributes) => [
            'action' => 'user.registered',
            'entity_type' => 'App\Models\User',
            'entity_id' => User::factory(),
            'meta' => [
                'ip_address' => fake()->ipv4(),
                'user_agent' => fake()->userAgent(),
                'registration_method' => 'api',
            ],
        ]);
    }

    /**
     * Create an audit log for user login.
     */
    public function userLogin(): static
    {
        return $this->state(fn (array $attributes) => [
            'action' => 'user.login',
            'entity_type' => 'App\Models\User',
            'entity_id' => User::factory(),
            'meta' => [
                'ip_address' => fake()->ipv4(),
                'user_agent' => fake()->userAgent(),
                'login_method' => 'email_password',
            ],
        ]);
    }

    /**
     * Create an audit log for identity verification.
     */
    public function identityVerification(): static
    {
        return $this->state(fn (array $attributes) => [
            'action' => fake()->randomElement(['user.identity_verified', 'user.identity_verification_failed']),
            'entity_type' => 'App\Models\User',
            'entity_id' => User::factory(),
            'meta' => [
                'ip_address' => fake()->ipv4(),
                'user_agent' => fake()->userAgent(),
                'verification_method' => 'ic_verification',
                'ic_number_masked' => '****-**-' . fake()->numerify('####'),
            ],
        ]);
    }

    /**
     * Create an audit log for company verification.
     */
    public function companyVerification(): static
    {
        return $this->state(fn (array $attributes) => [
            'action' => 'company.verified',
            'entity_type' => 'App\Models\Company',
            'entity_id' => Company::factory(),
            'meta' => [
                'ip_address' => fake()->ipv4(),
                'user_agent' => fake()->userAgent(),
                'verification_method' => 'ssm_verification',
                'ssm_number' => fake()->numerify('SSM-######'),
                'verification_result' => fake()->randomElement(['active', 'inactive', 'unknown']),
            ],
        ]);
    }

    /**
     * Create an audit log for company linking.
     */
    public function companyLinking(): static
    {
        return $this->state(fn (array $attributes) => [
            'action' => 'company.linked',
            'entity_type' => 'App\Models\Company',
            'entity_id' => Company::factory(),
            'meta' => [
                'ip_address' => fake()->ipv4(),
                'user_agent' => fake()->userAgent(),
                'linked_user_id' => User::factory(),
                'linking_method' => 'user_request',
            ],
        ]);
    }

    /**
     * Create an audit log for user deactivation.
     */
    public function userDeactivation(): static
    {
        return $this->state(fn (array $attributes) => [
            'action' => 'user.deactivated',
            'entity_type' => 'App\Models\User',
            'entity_id' => User::factory(),
            'meta' => [
                'ip_address' => fake()->ipv4(),
                'user_agent' => fake()->userAgent(),
                'deactivation_reason' => fake()->randomElement(['user_request', 'admin_action', 'policy_violation']),
                'tokens_revoked' => fake()->numberBetween(1, 5),
            ],
        ]);
    }

    /**
     * Create an audit log with a specific actor.
     */
    public function byActor(User $actor): static
    {
        return $this->state(fn (array $attributes) => [
            'actor_id' => $actor->id,
        ]);
    }

    /**
     * Create an audit log for a specific entity.
     */
    public function forEntity($entity): static
    {
        return $this->state(fn (array $attributes) => [
            'entity_type' => get_class($entity),
            'entity_id' => $entity->id,
        ]);
    }

    /**
     * Create an audit log without an actor (system action).
     */
    public function systemAction(): static
    {
        return $this->state(fn (array $attributes) => [
            'actor_id' => null,
            'action' => fake()->randomElement(['system.cleanup', 'system.maintenance', 'system.backup']),
            'meta' => [
                'system_process' => fake()->randomElement(['scheduled_task', 'maintenance_job', 'cleanup_job']),
                'execution_time' => fake()->numberBetween(100, 5000) . 'ms',
            ],
        ]);
    }
}