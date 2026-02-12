# -*- coding: utf-8 -*-
"""
Auto-generated main.py for AgentApp deployment.

This file imports and runs the AgentApp from the original entrypoint file,
avoiding circular deployment issues.
"""

import argparse

from agentscope_runtime.engine.deployers.utils.deployment_modes import DeploymentMode
from agentscope_test import app

# Type whitelist for argument parser to prevent code injection
ALLOWED_TYPES = {
    'int': int,
    'str': str,
    'float': float,
    'bool': bool,
}


def main():
    """Run the AgentApp service."""
    parser = argparse.ArgumentParser(description='app Service')
    parser.add_argument('--host', default='0.0.0.0', help='Host to bind to (default: 0.0.0.0)')
    parser.add_argument('--port', type=int, default=8090, help='Port to bind to (default: 8090)')
    parser.add_argument(
        '--embed-task-processor', action='store_true', default=False, help='Whether to embed task processor'
    )

    args = parser.parse_args()

    # Run the AgentApp with specified parameters
    app.run(
        mode=DeploymentMode.DETACHED_PROCESS,
        host=args.host,
        port=args.port,
        embed_task_processor=args.embed_task_processor,
    )


if __name__ == '__main__':
    main()
