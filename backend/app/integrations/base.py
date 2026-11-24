from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseIntegrationAdapter(ABC):
    @abstractmethod
    def get_provider_name(self) -> str:
        pass
        
    @abstractmethod
    def is_mock(self) -> bool:
        return True
