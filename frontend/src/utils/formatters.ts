export const formatCurrencyInput = (value: string): string => {
  if (!value) return '';
  const onlyDigits = value.replace(/\D/g, '').slice(0, 10);
  if (!onlyDigits) return '';
  
  const numberValue = Number(onlyDigits) / 100;
  return numberValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const parseCurrencyString = (value: string): number => {
  if (!value) return 0;
  const onlyDigits = value.replace(/\D/g, '').slice(0, 10);
  return Number(onlyDigits) / 100;
};

export const formatUppercase = (value: string): string => {
  return value.toUpperCase();
};

export const formatInteger = (value: string): string => {
  return value.replace(/\D/g, '');
};

export const formatWeightInput = (value: string): string => {
  if (!value) return '';
  const onlyDigits = value.replace(/\D/g, '').slice(0, 7);
  if (!onlyDigits) return '';
  
  const numberValue = Number(onlyDigits) / 1000;
  return numberValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });
};

export const parseWeightString = (value: string): number => {
  if (!value) return 0;
  const onlyDigits = value.replace(/\D/g, '').slice(0, 7);
  return Number(onlyDigits) / 1000;
};
