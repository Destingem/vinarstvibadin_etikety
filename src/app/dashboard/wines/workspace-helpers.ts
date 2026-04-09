export type WorkspaceWine = {
  $id: string;
  name: string;
  vintage?: number | string | null;
  batch?: string | null;
  alcoholContent?: number | null;
  energyValueKJ?: number | null;
  energyValueKcal?: number | null;
  fat?: number | null;
  saturatedFat?: number | null;
  carbs?: number | null;
  sugars?: number | null;
  protein?: number | null;
  salt?: number | null;
  ingredients?: string | null;
  additionalInfo?: string | null;
  allergens?: string | null;
  wineRegion?: string | null;
  wineSubregion?: string | null;
  wineVillage?: string | null;
  wineTract?: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  wineryName?: string;
  winerySlug?: string;
};

export function formatWorkspaceDate(value: string) {
  return new Date(value).toLocaleDateString('cs-CZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatWorkspaceAlcohol(value?: number | null) {
  return value ? `${value}% obj.` : 'Bez údaje';
}

export function getComplianceChecklist(wine: Partial<WorkspaceWine>) {
  return [
    {
      label: 'Obsah alkoholu',
      done: Boolean(wine.alcoholContent),
      hint: 'Nutný pro digitální etiketu.',
    },
    {
      label: 'Složení',
      done: Boolean(wine.ingredients),
      hint: 'Doporučeno pro veřejný detail.',
    },
    {
      label: 'Původ vína',
      done: Boolean(wine.wineRegion || wine.wineSubregion || wine.wineVillage || wine.wineTract),
      hint: 'Pomáhá důvěryhodnosti etikety.',
    },
    {
      label: 'Veřejná URL',
      done: Boolean(wine.winerySlug),
      hint: 'Potřebná pro QR workflow.',
    },
  ];
}

export function getNutritionOverview(wine: Partial<WorkspaceWine>) {
  return [
    {
      label: 'Energetická hodnota',
      value:
        wine.energyValueKJ || wine.energyValueKcal
          ? `${wine.energyValueKJ || 0} kJ / ${wine.energyValueKcal || 0} kcal`
          : 'Bez údaje',
    },
    { label: 'Tuky', value: wine.fat !== null && wine.fat !== undefined ? `${wine.fat} g` : '0 g' },
    {
      label: 'Nasycené MK',
      value: wine.saturatedFat !== null && wine.saturatedFat !== undefined ? `${wine.saturatedFat} g` : '0 g',
    },
    { label: 'Sacharidy', value: wine.carbs !== null && wine.carbs !== undefined ? `${wine.carbs} g` : '0 g' },
    { label: 'Cukry', value: wine.sugars !== null && wine.sugars !== undefined ? `${wine.sugars} g` : '0 g' },
    { label: 'Bílkoviny', value: wine.protein !== null && wine.protein !== undefined ? `${wine.protein} g` : '0 g' },
    { label: 'Sůl', value: wine.salt !== null && wine.salt !== undefined ? `${wine.salt} g` : '0 g' },
  ];
}
