import {DATA_URL} from '../../constants/default-settings';

export class ApiService {
    constructor(private readonly token: string | undefined) {}

    private getHeaders(isGuestUser: boolean = false): { [key: string]: string } {
        const headers = {
            'Content-Type': 'application/json',
        }
        if (this.token) {
            headers['Authorization'] = `Token ${isGuestUser ? "undefined" : this.token}`;
        }
        return headers;
    }

    private async post(path: string, data: any, queryParams: [string, string][] = []): Promise<any> {
        let url = new URL(`${DATA_URL}/${path}`);
        for (let param of queryParams) {
            if (param.length === 2) {
                url.searchParams.append(param[0], param[1]);
            }
        }
        let response = await fetch(url, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data, null, 2)
        });
        return await response.json();
    }

    private async put(path: string, data: any, queryParams: [string, string][] = []): Promise<any> {
        let url = new URL(`${DATA_URL}/${path}`);
        for (let param of queryParams) {
            if (param.length === 2) {
                url.searchParams.append(param[0], param[1]);
            }
        }
        let response = await fetch(url, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(data, null, 2)
        });
        return await response.json();
    }

    private async get(path: string, isGuestUser: boolean = false, queryParams: [string, string][] = []): Promise<any> {
        let url = new URL(`${DATA_URL}/${path}`);
        for (let param of queryParams) {
            if (param.length === 2) {
                url.searchParams.append(param[0], param[1]);
            }
        }
        let response = await fetch(url, {
            method: 'GET',
            headers: this.getHeaders(isGuestUser),
        });
        return await response.json();
    }

    public getPredictions(isGuestUser: boolean) {
        return this.get('predictions', isGuestUser);
    }

    public getScenarios(isGuestUser: boolean) {
        return this.get('scenarios', isGuestUser);
    }

    public createPrediction(name: string, simulationInput: any) {
        return this.post('predictions', simulationInput, [['name', name]]);
    }

    public createScenario(name: string, project: string, data: any) {
        return this.post('scenarios', data, [['name', name], ['project', project]]);
    }

    public updateScenario(scenarioId: string, name: string, changes: any) {
        return this.put(`scenarios/${scenarioId}`, changes, [['name', name]]);
    }

    public isScenarioNameUsed(name: string) {
        return this.get(`scenarios/${name}`);
    }

    public isPredictionNameUsed(name: string) {
        return this.get(`predictions/${name}`);
    }
}
