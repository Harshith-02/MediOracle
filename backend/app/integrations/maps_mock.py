import math
from typing import Dict, Any
from app.integrations.base import BaseIntegrationAdapter

class MockMapsService(BaseIntegrationAdapter):
    """
    Mock Geocoding & Commute Estimation Service.
    """
    def get_provider_name(self) -> str:
        return "MediOracle Geocoding & Route Sandbox (Demo)"

    def is_mock(self) -> bool:
        return True

    def calculate_commute(self, origin_lat: float, origin_lon: float, dest_lat: float, dest_lon: float) -> Dict[str, Any]:
        R = 6371.0
        dlat = math.radians(dest_lat - origin_lat)
        dlon = math.radians(dest_lon - origin_lon)
        a = math.sin(dlat / 2)**2 + math.cos(math.radians(origin_lat)) * math.cos(math.radians(dest_lat)) * math.sin(dlon / 2)**2
        dist_km = round(2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)) * R, 1)
        
        estimated_minutes = int(dist_km * 2.2) # ~2.2 mins per km in Dublin traffic
        
        return {
            "distance_km": dist_km if dist_km > 0 else 8.5,
            "estimated_drive_minutes": estimated_minutes if estimated_minutes > 0 else 18,
            "transit_minutes": estimated_minutes + 12,
            "provider": self.get_provider_name(),
            "disclaimer": "Simulated route estimate."
        }

maps_service = MockMapsService()
