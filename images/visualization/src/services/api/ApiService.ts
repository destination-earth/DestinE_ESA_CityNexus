import {DATA_URL} from '../../constants/default-settings';
import JSZip from 'jszip';

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

    private async postPrediction(path: string, data: any, queryParams: [string, string][] = []): Promise<any> {
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
        const responseMessage = await response.json();
        return {status: response.status, statusText: response.statusText, ...responseMessage};
    }

    private async postScenario(path: string, data: any, queryParams: [string, string][] = []): Promise<any> {
        let url = new URL(`${DATA_URL}/${path}`);
        for (let param of queryParams) {
            if (param.length === 2) {
                url.searchParams.append(param[0], param[1]);
            }
        }
        // Compress JSON data using JSZip
        const zip = new JSZip();
        zip.file('data.json', JSON.stringify(data, null, 2));
        const zippedContent = await zip.generateAsync({ type: 'arraybuffer', compression: 'DEFLATE' });
        let headers = this.getHeaders();
        headers['Content-Encoding'] = 'zip';
        headers['Content-Type'] = 'application/zip';
        let response = await fetch(url, {
            method: 'POST',
            headers,
            body: zippedContent
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
        // Compress JSON data using JSZip
        const zip = new JSZip();
        zip.file('data.json', JSON.stringify(data, null, 2));
        const zippedContent = await zip.generateAsync({ type: 'arraybuffer', compression: 'DEFLATE' });
        let headers = this.getHeaders();
        headers['Content-Encoding'] = 'zip';
        headers['Content-Type'] = 'application/zip';
        let response = await fetch(url, {
            method: 'PUT',
            headers,
            body: zippedContent
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
        return this.postPrediction('predictions', simulationInput, [['name', name]]);
    }

    public createScenario(name: string, project: string, city: string, data: any) {
        return this.postScenario('scenarios', data, [['name', name], ['project', project], ['city', city]]);
    }

    public updateScenario(scenarioId: string, name: string, changes: any) {
        return this.put(`scenarios/${scenarioId}`, changes, [['name', name]]);
    }

    public isScenarioNameUsed(name: string, city: string) {
        return this.get(`scenarios/${name}`, false, [['city', city]]);
    }

    public isPredictionNameUsed(name: string, scenarioId: string) {
        return this.get(`predictions/${name}`, false, [['scenario_id', scenarioId]]);
    }
}
