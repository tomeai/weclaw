from fastmcp import FastMCP

# Create a basic server instance
mcp = FastMCP(name='MyAssistantServer')

# You can also add instructions for how to interact with the server
mcp_with_instructions = FastMCP(
    name='HelpfulAssistant',
    instructions="""
        This server provides data analysis tools.
        Call get_average() to analyze numerical data.
    """,
)


@mcp.tool
def multiply(a: float, b: float) -> float:
    """Multiplies two numbers together."""
    return a * b


@mcp.resource('data://config')
def get_config() -> dict:
    """Provides the application configuration."""
    return {'theme': 'dark', 'version': '1.0'}


@mcp.resource('users://{user_id}/profile')
def get_user_profile(user_id: int) -> dict:
    """Retrieves a user's profile by ID."""
    # The {user_id} in the URI is extracted and passed to this function
    return {'id': user_id, 'name': f'User {user_id}', 'status': 'active'}


@mcp.prompt
def analyze_data(data_points: list[float]) -> str:
    """Creates a prompt asking for analysis of numerical data."""
    formatted_data = ', '.join(str(point) for point in data_points)
    return f'Please analyze these data points: {formatted_data}'
