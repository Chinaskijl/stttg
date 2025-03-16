
import { Alliance, AllianceApplication } from '../shared/allianceTypes';
import { storage } from './storage';

class AllianceManager {
  private alliances: Alliance[] = [];
  private applications: AllianceApplication[] = [];

  async createAlliance(data: Partial<Alliance>): Promise<Alliance> {
    const alliance: Alliance = {
      id: Date.now().toString(),
      name: data.name!,
      accessType: data.accessType!,
      goal: data.goal!,
      members: [],
      resources: {
        gold: 0,
        wood: 0,
        food: 0,
        oil: 0,
        metal: 0,
        steel: 0,
        weapons: 0
      },
      createdAt: Date.now(),
      lastWithdrawalTimes: {}
    };

    this.alliances.push(alliance);
    await this.saveAlliances();
    return alliance;
  }

  async getAlliances(): Promise<Alliance[]> {
    return this.alliances;
  }

  private async saveAlliances() {
    await storage.set('alliances', this.alliances);
  }

  // Additional methods will be implemented here
}

export const allianceManager = new AllianceManager();
