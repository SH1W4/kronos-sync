#!/usr/bin/env python3

import os
import json
from typing import Dict, List, Optional
from dataclasses import dataclass
from enum import Enum

class ArchitectureLevel(Enum):
    BASIC = "basic"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"

@dataclass
class ComponentAnalysis:
    name: str
    level: ArchitectureLevel
    dependencies: List[str]
    tech_stack: List[str]
    maturity: float  # 0-1
    risk_level: float  # 0-1
    integration_points: List[str]

class ArchitecturalAnalyzer:
    def __init__(self):
        self.analyzed_components = {}
        self.integration_matrix = {}
        self.risk_factors = {}
        self.suggested_path = None

    def analyze_component(self, component: Dict) -> ComponentAnalysis:
        analysis = ComponentAnalysis(
            name=component["name"],
            level=self.determine_level(component),
            dependencies=component.get("dependencies", []),
            tech_stack=component.get("tech_stack", []),
            maturity=self.calculate_maturity(component),
            risk_level=self.assess_risk(component),
            integration_points=self.identify_integration_points(component)
        )
        return analysis

    def determine_level(self, component: Dict) -> ArchitectureLevel:
        features = component.get("features", [])
        tech_stack = component.get("tech_stack", [])
        
        if "Docker" in tech_stack and "microservices" in features:
            return ArchitectureLevel.ADVANCED
        elif "API" in features and len(tech_stack) > 3:
            return ArchitectureLevel.INTERMEDIATE
        return ArchitectureLevel.BASIC

    def calculate_maturity(self, component: Dict) -> float:
        implemented = len([f for f in component.get("features", []) if f.get("status") == "completed"])
        total = len(component.get("features", []))
        return implemented / total if total > 0 else 0

    def assess_risk(self, component: Dict) -> float:
        risk_factors = {
            "security_concerns": 0.3,
            "technical_debt": 0.2,
            "dependency_complexity": 0.2,
            "integration_complexity": 0.3
        }
        
        total_risk = 0
        for factor, weight in risk_factors.items():
            if factor in component.get("risks", []):
                total_risk += weight
        
        return total_risk

    def identify_integration_points(self, component: Dict) -> List[str]:
        integration_points = []
        
        if "api" in component.get("features", []):
            integration_points.append("REST API")
        if "events" in component.get("features", []):
            integration_points.append("Event Bus")
        if "database" in component.get("features", []):
            integration_points.append("Database")
            
        return integration_points

    def analyze_kronos_projects(self):
        # Análise do projeto original
        kronos_original = {
            "name": "Kronos Original",
            "features": [
                {"name": "API Core", "status": "in_progress"},
                {"name": "Analytics", "status": "completed"},
                {"name": "N8N Integration", "status": "completed"},
                {"name": "Security", "status": "in_progress"}
            ],
            "tech_stack": ["Python", "FastAPI", "PostgreSQL", "Redis", "N8N"],
            "risks": ["integration_complexity", "technical_debt"],
            "dependencies": ["PostgreSQL", "Redis", "N8N"]
        }

        # Análise do KRONOS SYNC
        kronos_sync = {
            "name": "KRONOS SYNC",
            "features": [
                {"name": "Next.js Frontend", "status": "completed"},
                {"name": "Prisma ORM", "status": "completed"},
                {"name": "Docker", "status": "completed"},
                {"name": "Cinema Booking", "status": "completed"},
                {"name": "Kiosk System", "status": "completed"}
            ],
            "tech_stack": ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "Docker"],
            "risks": ["security_concerns"],
            "dependencies": ["PostgreSQL", "Docker"]
        }

        self.analyzed_components = {
            "original": self.analyze_component(kronos_original),
            "sync": self.analyze_component(kronos_sync)
        }

        self.analyze_integration_possibilities()
        return self.generate_recommendation()

    def analyze_integration_possibilities(self):
        original = self.analyzed_components["original"]
        sync = self.analyzed_components["sync"]

        # Matriz de integração
        self.integration_matrix = {
            "database": {
                "complexity": "low",
                "approach": "Use Prisma as main ORM, migrate FastAPI models",
                "risk": 0.3
            },
            "frontend": {
                "complexity": "medium",
                "approach": "Adopt Next.js frontend, keep FastAPI as main backend",
                "risk": 0.5
            },
            "authentication": {
                "complexity": "high",
                "approach": "Implement JWT auth with Next.js/FastAPI",
                "risk": 0.7
            },
            "workflows": {
                "complexity": "medium",
                "approach": "Keep N8N, integrate with Next.js via API",
                "risk": 0.5
            }
        }

        # Fatores de risco
        self.risk_factors = {
            "data_migration": 0.6,
            "service_disruption": 0.4,
            "technical_complexity": 0.5,
            "team_adaptation": 0.3
        }

        # Determinar caminho sugerido
        if original.maturity < 0.5 and sync.maturity > 0.8:
            self.suggested_path = "migrate_to_sync"
        elif original.maturity > 0.8:
            self.suggested_path = "enhance_original"
        else:
            self.suggested_path = "hybrid_approach"

    def generate_recommendation(self) -> Dict:
        recommendation = {
            "analysis": {
                "original_project": {
                    "maturity": self.analyzed_components["original"].maturity,
                    "risk_level": self.analyzed_components["original"].risk_level,
                    "tech_stack": self.analyzed_components["original"].tech_stack
                },
                "sync_project": {
                    "maturity": self.analyzed_components["sync"].maturity,
                    "risk_level": self.analyzed_components["sync"].risk_level,
                    "tech_stack": self.analyzed_components["sync"].tech_stack
                }
            },
            "integration_matrix": self.integration_matrix,
            "risk_factors": self.risk_factors,
            "recommended_path": self.suggested_path,
            "steps": self.generate_integration_steps()
        }
        return recommendation

    def generate_integration_steps(self) -> List[Dict]:
        if self.suggested_path == "migrate_to_sync":
            return [
                {
                    "phase": "Preparação",
                    "steps": [
                        "Setup do ambiente Next.js",
                        "Configuração do Prisma",
                        "Preparação do Docker"
                    ]
                },
                {
                    "phase": "Migração de Dados",
                    "steps": [
                        "Export dos dados existentes",
                        "Adaptação para novo schema",
                        "Import no novo sistema"
                    ]
                },
                {
                    "phase": "Integração de Sistemas",
                    "steps": [
                        "Configuração do N8N no novo ambiente",
                        "Adaptação dos workflows",
                        "Testes de integração"
                    ]
                }
            ]
        elif self.suggested_path == "enhance_original":
            return [
                {
                    "phase": "Modernização",
                    "steps": [
                        "Atualização das dependências",
                        "Implementação de novos features",
                        "Melhorias de UI/UX"
                    ]
                },
                {
                    "phase": "Integração de Features",
                    "steps": [
                        "Import do sistema de Kiosk",
                        "Adaptação do booking cinema",
                        "Implementação do marketplace"
                    ]
                }
            ]
        else:  # hybrid_approach
            return [
                {
                    "phase": "Análise e Planejamento",
                    "steps": [
                        "Identificação de componentes a manter",
                        "Mapeamento de integrações",
                        "Definição de arquitetura híbrida"
                    ]
                },
                {
                    "phase": "Implementação",
                    "steps": [
                        "Setup de comunicação entre sistemas",
                        "Implementação de gateway API",
                        "Configuração de autenticação unificada"
                    ]
                }
            ]

if __name__ == "__main__":
    analyzer = ArchitecturalAnalyzer()
    recommendation = analyzer.analyze_kronos_projects()
    
    print("\n=== Análise Arquitetural dos Projetos Kronos ===\n")
    print("Projeto Original:")
    print(f"- Maturidade: {recommendation['analysis']['original_project']['maturity']:.2%}")
    print(f"- Nível de Risco: {recommendation['analysis']['original_project']['risk_level']:.2%}")
    print(f"- Stack: {', '.join(recommendation['analysis']['original_project']['tech_stack'])}")
    
    print("\nKRONOS SYNC:")
    print(f"- Maturidade: {recommendation['analysis']['sync_project']['maturity']:.2%}")
    print(f"- Nível de Risco: {recommendation['analysis']['sync_project']['risk_level']:.2%}")
    print(f"- Stack: {', '.join(recommendation['analysis']['sync_project']['tech_stack'])}")
    
    print("\nCaminho Recomendado:", recommendation['recommended_path'].replace('_', ' ').title())
    
    print("\nPróximos Passos:")
    for phase in recommendation['steps']:
        print(f"\n{phase['phase']}:")
        for step in phase['steps']:
            print(f"- {step}")

    print("\nMatriz de Integração:")
    for component, details in recommendation['integration_matrix'].items():
        print(f"\n{component.title()}:")
        print(f"- Complexidade: {details['complexity']}")
        print(f"- Abordagem: {details['approach']}")
        print(f"- Risco: {details['risk']:.2%}")

    print("\nFatores de Risco:")
    for factor, value in recommendation['risk_factors'].items():
        print(f"- {factor.replace('_', ' ').title()}: {value:.2%}")
