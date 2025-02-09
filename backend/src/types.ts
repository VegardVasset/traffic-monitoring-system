export interface MockRecord {
  id: number;
  creationTime: string;
  receptionTime: string;
  vehicleType: 
    | "buss" | "lastebil sylinder" | "person transport" | "camping kjøretøy" 
    | "lett industri" | "tilhenger" | "lastebil åpen" | "motorsykkel"
    | "traktor" | "lastebil lukket" | "myke trafikanter" | "utrykningskjøretøy";
  camera: string;  
  laneId: string;
  edgeId: string;
  imageUrl: string;
  confidenceScore: number;
  corrected: boolean;
  tireType?: "Sommerdekk" | "Vinterdekk";
  tireCondition?: number;
  passengerCount?: number;
}
