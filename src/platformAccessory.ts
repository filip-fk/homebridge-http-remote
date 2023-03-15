import { Service, PlatformAccessory, CharacteristicValue, CharacteristicSetCallback, CharacteristicGetCallback } from 'homebridge';
import { HttpRemotePlatform } from './platform';

export class HttpRemoteAccessory {
  private tvService: Service;

  private states = {
    Active: false,
    ActiveIdentifier: 1,
    RemoteKey: 0,
  };

  constructor(
    private readonly platform: HttpRemotePlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    const Characteristic = this.platform.Characteristic;
    this.accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(Characteristic.Manufacturer, accessory.context.device.manufacturer || 'Mateffy')
      .setCharacteristic(Characteristic.Model, accessory.context.device.model || 'TV')
      .setCharacteristic(Characteristic.SerialNumber, accessory.context.device.serialNumber);

    this.tvService = 
      this.accessory.getService(this.platform.Service.Television) || 
      this.accessory.addService(this.platform.Service.Television);

    this.tvService
      .setCharacteristic(
        Characteristic.Name, 
        accessory.context.device.name || 'TV'
      )
      .setCharacteristic(
				Characteristic.ConfiguredName,
				accessory.context.device.name || 'TV'
			)
			.setCharacteristic(
				Characteristic.SleepDiscoveryMode,
				Characteristic.SleepDiscoveryMode.ALWAYS_DISCOVERABLE
			);

    this.tvService.setCharacteristic(
      Characteristic.ActiveIdentifier,
      this.states.ActiveIdentifier
    );

    // turn device on/off
    this.tvService
			.getCharacteristic(Characteristic.Active)
			.on('set', this.setActive.bind(this))
			.on('get', this.getActive.bind(this));

    // set sources, 
    this.tvService
			.getCharacteristic(Characteristic.ActiveIdentifier)
			.on('set', this.setActiveIdentifier.bind(this))
			.on('get', this.getActiveIdentifier.bind(this));

    // remote control input
    this.tvService
    .getCharacteristic(Characteristic.RemoteKey)
    .onSet(this.setButton.bind(this));
  }

  async setButton(
    value: CharacteristicValue,
  ) {
    this.platform.log.debug('Set Characteristic Active ->', value);
    try {
      let url = "";
    
      switch(value) {
        case 0: {
          break;
        }
        case 1: {
          break;
        }
        case 2: {
          break;
        }
        case 3: {
          break;
        }
        case 4: {
          url = this.accessory.context.device.button?.upUrl;
          break;
        }
        case 5: {
          url = this.accessory.context.device.button?.downUrl;
          break;
        }
        case 6: {
          url = this.accessory.context.device.button?.leftUrl;
          break;
        }
        case 7: {
          url = this.accessory.context.device.button?.rightUrl;
          break;
        }
        case 8: {
          url = this.accessory.context.device.button?.selectUrl;
          break;
        }
        case 9: {
          url = this.accessory.context.device.button?.backUrl;
          break;
        }
        case 10: {
          break;
        }
        case 11: {
          break;
        }
        case 15: {
          url = this.accessory.context.device.button?.infoUrl;
          break;
        }
      }
      await this.httpRequest(
				url,
				this.accessory.context.device.button?.method ||
					this.accessory.context.device.method,
				{
					...(this.accessory.context.device.headers || {}),
					...(this.accessory.context.device.button?.headers || {}),
				},
				this.accessory.context.device.button?.body
			);
      this.states.RemoteKey = value as number;
    } catch (e) {
      this.platform.log.error('Cannot update TV power via HTTP', e);
    }
  }

	async setActive(
		value: CharacteristicValue,
		callback: CharacteristicSetCallback
	) {
		this.platform.log.debug('Set Characteristic Active ->', value);
		try {
			const url = (value as boolean)
				? this.accessory.context.device.power?.onUrl
				: this.accessory.context.device.power?.offUrl;
    
			if (!url) {
				throw new Error(`TV ${this.accessory.context.device.name} does not have an ${(value as boolean) ? 'on' : 'off'}Url`);
			}

			await this.httpRequest(
				url,
				this.accessory.context.device.power?.method ||
					this.accessory.context.device.method,
				{
					...(this.accessory.context.device.headers || {}),
					...(this.accessory.context.device.power?.headers || {}),
				},
				this.accessory.context.device.power?.body
			);

			this.states.Active = value as boolean;
			callback(null);
		} catch (e) {
			this.platform.log.error('Cannot update TV power via HTTP', e);
			callback(e);
		}
	}

  //check if the device is on
	getActive(callback: CharacteristicGetCallback) {
		const isOn = this.states.Active;
		this.platform.log.debug('Get Characteristic Active ->', isOn);
		callback(null, isOn);
	}

	async setActiveIdentifier(
		value: CharacteristicValue,
		callback: CharacteristicSetCallback
	) {
		this.platform.log.debug(
			'Set Characteristic ActiveIdentifier -> ',
			value);

		try {
			const sourceIndex = (value as number) - 1;
			const source = this.accessory.context.device.sources[sourceIndex];

			if (!source) {
				throw new Error(
					`Source with Identifier ${value} does not exist in configuration`
				);
			}

			await this.httpRequest(
				source.url,
				source.method || this.accessory.context.device.method,
				{
					...(this.accessory.context.device.headers || {}),
					...(source.headers || {}),
				},
				source.body
			);

			this.states.ActiveIdentifier = value as number;
			callback(null);
		} catch (e) {
			this.platform.log.error('Cannot update input change via HTTP', e);
			callback(e);
		}
	}

  // check if the device is on
	getActiveIdentifier(callback: CharacteristicGetCallback) {
		const activeIdentifier = this.states.ActiveIdentifier;

		this.platform.log.debug(
			'Get Characteristic ActiveIdentifier ->',
			activeIdentifier
		);
		callback(null, activeIdentifier);
	}

	async httpRequest(
		url: string,
		method = 'GET',
		headers?: { [key: string]: string },
		body?: string
	) {
		const response = await fetch(url, {
			method,
			headers,
			body,
		});

		if (!response.ok) {
			throw new Error(`${response.status}: ${await response.text()}`);
		}

		this.platform.log.debug('Update HTTP request: OK');
	}
}
