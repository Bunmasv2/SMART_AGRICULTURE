export interface DiseaseManagement {
  cultural: string;
  chemical: string;
}

export interface DiseaseDetail {
  id: string;
  nameVN: string;
  leafCondition: string;
  soilCondition: string;
  symptoms: string;
  causes: string;
  management: DiseaseManagement;
  imageUrl?: string | null;
}