import Conf from 'conf';
import { homedir } from 'os';
import { join } from 'path';
import { existsSync, unlinkSync } from 'fs';
import { API_KEY_VISIBLE_CHARS, API_KEY_MASK } from '../constants.js';
import type { ConfigSchema } from './types.js';

const CONFIG_DIR = join(homedir(), '.mite-cli');

class ConfigManager {
  private conf: Conf<ConfigSchema>;

  constructor() {
    const configPath = join(CONFIG_DIR, 'config.json');
    try {
      this.conf = new Conf<ConfigSchema>({
        projectName: 'mite-cli',
        cwd: CONFIG_DIR,
        configName: 'config',
      });
    } catch (error) {
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        if (existsSync(configPath)) {
          unlinkSync(configPath);
        }
        this.conf = new Conf<ConfigSchema>({
          projectName: 'mite-cli',
          cwd: CONFIG_DIR,
          configName: 'config',
        });
      } else {
        throw error;
      }
    }
  }

  getApiKey(): string | undefined {
    return this.conf.get('apiKey');
  }

  setApiKey(apiKey: string): void {
    this.conf.set('apiKey', apiKey);
  }

  getAccount(): string | undefined {
    return this.conf.get('account');
  }

  setAccount(account: string): void {
    this.conf.set('account', account);
  }

  getUsers(): Record<string, string> {
    return this.conf.get('users') || {};
  }

  setUser(id: string, abbreviation: string): void {
    const users = this.getUsers();
    users[id] = abbreviation;
    this.conf.set('users', users);
  }

  removeUser(id: string): boolean {
    const users = this.getUsers();
    if (!(id in users)) return false;
    delete users[id];
    this.conf.set('users', users);
    return true;
  }

  getCustomers(): Record<string, string> {
    return this.conf.get('customers') || {};
  }

  setCustomer(id: string, abbreviation: string): void {
    const customers = this.getCustomers();
    customers[id] = abbreviation;
    this.conf.set('customers', customers);
  }

  removeCustomer(id: string): boolean {
    const customers = this.getCustomers();
    if (!(id in customers)) return false;
    delete customers[id];
    this.conf.set('customers', customers);
    return true;
  }

  getProjects(): Record<string, string> {
    return this.conf.get('projects') || {};
  }

  setProject(id: string, abbreviation: string): void {
    const projects = this.getProjects();
    projects[id] = abbreviation;
    this.conf.set('projects', projects);
  }

  removeProject(id: string): boolean {
    const projects = this.getProjects();
    if (!(id in projects)) return false;
    delete projects[id];
    this.conf.set('projects', projects);
    return true;
  }

  abbreviateUser(id: number | string): string {
    const users = this.getUsers();
    return users[String(id)] || `User#${id}`;
  }

  abbreviateCustomer(id: number | string): string {
    const customers = this.getCustomers();
    return customers[String(id)] || `Customer#${id}`;
  }

  abbreviateProject(id: number | string): string {
    const projects = this.getProjects();
    return projects[String(id)] || `Project#${id}`;
  }

  getTeams(): Record<string, string[]> {
    return this.conf.get('teams') || {};
  }

  getTeam(name: string): string[] | undefined {
    const teams = this.getTeams();
    return teams[name];
  }

  setTeam(name: string, userIds: string[]): void {
    const teams = this.getTeams();
    teams[name] = userIds;
    this.conf.set('teams', teams);
  }

  removeTeam(name: string): boolean {
    const teams = this.getTeams();
    if (!(name in teams)) return false;
    delete teams[name];
    this.conf.set('teams', teams);
    return true;
  }

  addTeamMembers(name: string, userIds: string[]): void {
    const teams = this.getTeams();
    if (!teams[name]) {
      throw new Error(`Team "${name}" does not exist`);
    }
    const existing = new Set(teams[name]);
    for (const id of userIds) {
      existing.add(id);
    }
    teams[name] = [...existing];
    this.conf.set('teams', teams);
  }

  removeTeamMember(name: string, userId: string): boolean {
    const teams = this.getTeams();
    if (!teams[name]) {
      throw new Error(`Team "${name}" does not exist`);
    }
    const index = teams[name].indexOf(userId);
    if (index === -1) return false;
    teams[name].splice(index, 1);
    this.conf.set('teams', teams);
    return true;
  }

  getAll(): ConfigSchema {
    return this.conf.store;
  }

  getMaskedConfig(): Record<string, unknown> {
    const all = this.getAll();
    return {
      ...all,
      apiKey: all.apiKey ? all.apiKey.slice(0, API_KEY_VISIBLE_CHARS) + API_KEY_MASK : undefined,
    };
  }
}

export const config = new ConfigManager();
