// Feature flags component
export class FeatureFlagsComponent {
  featureFlags = [
    {
      name: 'Enable Gemini 2.5 Pro (Preview) for all clients',
      enabled: true,
      description: 'Allow all clients to use the Gemini 2.5 Pro (Preview) model for generating text.',
    },
    {
      name: 'Enable advanced QR code options',
      enabled: false,
      description: 'Enable advanced QR code customization options like colors and logos.',
    }
  ];

  // Methods to toggle feature flags
  toggleFeatureFlag(index: number): void {
    this.featureFlags[index].enabled = !this.featureFlags[index].enabled;
  }

  // Method to check if a feature flag is enabled
  isFeatureEnabled(flagName: string): boolean {
    const flag = this.featureFlags.find(flag => flag.name === flagName);
    return flag ? flag.enabled : false;
  }
}

// Export a singleton instance
export const featureFlagsService = new FeatureFlagsComponent();