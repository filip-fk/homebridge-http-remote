import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { HttpRemoteAccessory } from './platformAccessory';

export class HttpRemotePlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;
  public readonly accessories: PlatformAccessory[] = [];

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.log.debug('Finished initializing platform:', this.config.name);

    this.api.on('didFinishLaunching', () => {
      log.debug('Executed didFinishLaunching callback');
      this.discoverDevices();
    });
  }

  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);
    this.accessories.push(accessory);
  }

  discoverDevices() {
    interface DeviceConfig {
      serialNumber: string;
      name: string
    }
    const foundUUIDs: string[] = [];

    for (const device of this.config.devices as DeviceConfig[]) {
      if (!device.serialNumber) {
				this.log.error('Could not initialize HTTP TV, missing serial number', device);
				continue;
			}
      const uuid = this.api.hap.uuid.generate(device.serialNumber);
      foundUUIDs.push(uuid);

      const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);

      if (existingAccessory) {
        this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);
        new HttpRemoteAccessory(this, existingAccessory);
        this.api.updatePlatformAccessories([existingAccessory]);
      } else {
        this.log.info('Adding new accessory:', device.name);
        const accessory = new this.api.platformAccessory(device.name, uuid);

        accessory.context.device = device;
        new HttpRemoteAccessory(this, accessory);
        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      }

      this.accessories
				.filter((accessory) => !foundUUIDs.includes(accessory.UUID))
				.forEach((accessory) => {
					this.api.unregisterPlatformAccessories(
						PLUGIN_NAME,
						PLATFORM_NAME,
						[accessory]
					);
					this.log.info(
						'Removing existing accessory from cache:',
						accessory.displayName
					);
				});
    }
  }
}
