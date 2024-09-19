export class SimulationParameters {
    public name: string = "Simulation " + (new Date()).toISOString();
    public bicyclePercentage: number = 0;
    public eVehiclePercentage: number = 0;
    public timeSlot: string[] = ["3"];
    public dayType: string[] = ['weekday'];
}
