export interface AnamneseFormData {
    nomeCompleto: string;
    whatsapp: string;
    dataNascimento: string;

    // Saúde
    condicaoMedicaGeral: boolean;
    detalhesCondicaoMedica?: string;

    problemaCicatrizacao: boolean;
    detalhesCicatrizacao?: string;

    alergias: boolean;
    detalhesAlergias?: string; // Tintas, materiais, látex

    // Procedimento (Preenchido no momento)
    artistaResponsavel: string; // @handle ou ID
    descricaoArte: string;
    valorAcertado: number;

    // Termos
    cientePermanencia: boolean;
    compromissoCuidados: boolean;
    aceiteTermosResponsabilidade: boolean;

    // Metadados
    dataPreenchimento: Date;
    ipOrigem?: string;
}

// Mapeamento CSV -> Sistema (Para importação futura)
export const CSV_HEADER_MAPPING = {
    "Qual seu nome completo?": "nomeCompleto",
    "Qual é o seu número do WhatsApp?": "whatsapp",
    "Quando é o seu aniversário?": "dataNascimento",
    "Você tem alguma condição médica que possa afetar o processo de tatuagem?": "condicaoMedicaGeral",
    "Você possui alguma condição médica que possa afetar o processo de cicatrização da tatuagem?": "problemaCicatrizacao",
    "Tem alguma alergia conhecida a produtos, como; tintas ou materiais de curativo?": "alergias",
    "Qual o @ da(o) artista responsável pelo seu projeto?": "artistaResponsavel",
    "qual a arte?": "descricaoArte",
    "Qual foi o valor acertado entre você e o artista?": "valorAcertado"
}
