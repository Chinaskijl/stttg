
export type AllianceRole = 'leader' | 'officer' | 'member';
export type AllianceAccessType = 'open' | 'closed' | 'approval';
export type AllianceGoal = 'economy' | 'warfare' | 'technology';

export interface AllianceMember {
  userId: string;
  role: AllianceRole;
  joinedAt: number;
  resourceContribution: number;
}

export interface Alliance {
  id: string;
  name: string;
  accessType: AllianceAccessType;
  goal: AllianceGoal;
  members: AllianceMember[];
  resources: {
    gold: number;
    wood: number;
    food: number;
    oil: number;
    metal: number;
    steel: number;
    weapons: number;
  };
  createdAt: number;
  lastWithdrawalTimes: Record<string, number>;
}

export interface AllianceApplication {
  userId: string;
  allianceId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: number;
}
