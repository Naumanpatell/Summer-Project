from fastapi import APIRouter

router = APIRouter(tags=["neighbourhood"])


@router.get("/neighbourhood/{postcode}")
async def get_neighbourhood(postcode: str):
    # TODO: call UK Police API, Environment Agency, Transport API, ONS
    return {
        "postcode": postcode.upper(),
        "crime": None,
        "flood_risk": None,
        "transport": None,
        "price_trends": None,
    }
