---
layout: post
title: "Second Post"
date: 2025-07-28 00:00:00 +0000
---

This is my second post in this blog. I want to include more source code examples.

```python
#!/usr/bin/env python3
"""
GitHub Repository Audit Tool

Manages GitHub custom properties for organizational compliance.
Identifies repositories that need CMDB CI numbers, tech owner emails,
and cost center assignments to meet governance requirements.
"""

import re
import os
import logging
import sys
from datetime import datetime
from typing import Optional

import pandas as pd
import typer
from dotenv import load_dotenv
from github import Auth, Github

# Write logs to STDOUT for better visibility in CI/CD pipelines
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    stream=sys.stdout
)
logger = logging.getLogger(__name__)

load_dotenv()

app = typer.Typer()

# Fail fast if authentication is missing to prevent silent failures
gh_token = os.getenv("GITHUB_TOKEN")
if not gh_token:
    logger.error("Please set the GITHUB_TOKEN environment variable.")
    raise SystemExit("Please set the GITHUB_TOKEN environment variable.")

auth = Auth.Token(gh_token)

# Higher per_page reduces API calls for large organizations
gh = Github(auth=auth, per_page=100)

gh_org = os.getenv("GITHUB_ORG")
if not gh_org:
    logger.error("Please set the GITHUB_ORG environment variable.")
    raise SystemExit("Please set the GITHUB_ORG environment variable.")

# CMDB CI format validation - exactly 14 digits after "CI" prefix
ci_pattern = r"^CI\d{14}$"

# Default values indicate unset properties that need attention
ci_prop = "cmdb-ci"
ci_default_value = "CMDB CI #"
email_prop = "tech-owner-email"
email_default_value = "Lilly Email Address"
cost_center_prop = "us-cost-center"
cost_center_default_value = "us-cost-center #"


@app.command()
def get_user():
    """Display current authenticated user information for verification."""
    user = gh.get_user()
    logger.info(f"{user.login} - {user.name} - {user.email}")


@app.command()
def list_repos(filename: Optional[str] = None):
    """
    Export repositories requiring property updates to Excel.

    Filters repos based on admin permissions and compliance status
    to focus effort on actionable items.
    """
    rows = list()
    total_repo_count = 0
    keep_repo_count = 0
    skip_repo_count = 0

    logger.info(f"Listing repos for {gh_org}...")

    repos = gh.get_organization(str(gh_org)).get_repos()
    for _, repo in enumerate(repos):
        total_repo_count += 1

        # Normalize default values to None for cleaner data analysis
        ci = repo.custom_properties.get(ci_prop)
        if ci in [ci_default_value]:
            ci = None

        email = repo.custom_properties.get("tech-owner-email")
        if email in ["Lilly Email Address"]:
            email = None

        cost_center = repo.custom_properties.get("us-cost-center")
        if cost_center in ["us-cost-center #"]:
            cost_center = None

        row = {
            "id": repo.id,
            "org": repo.organization.login,
            "name": repo.name,
            "ci": ci,
            "email": email,
            "cost_center": cost_center,
            "archived": repo.archived,
        }

        # Skip repos that don't need attention or can't be modified
        if repo.archived:
            skip_repo_count += 1
        elif ci and isinstance(ci, str) and re.match(ci_pattern, ci):
            # Already compliant with CMDB CI requirements
            skip_repo_count += 1
        elif repo.permissions.admin:
            # Only include repos we can actually modify
            keep_repo_count += 1
            rows.append(row)
            logger.info(f"{repo.organization.login}/{repo.name} (total = {total_repo_count}, keep = {keep_repo_count})")
        else:
            skip_repo_count += 1

    # Generate timestamped filename for tracking multiple audits
    if not filename:
        now = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"repos_{now}.xlsx"
    df = pd.DataFrame(rows)
    df.to_excel(filename, header=True, index=False)

    logger.info(f"Wrote {keep_repo_count} rows to {filename}")
    logger.info(f"Total repo count: {total_repo_count}")


@app.command()
def update_properties(filename: str):
    """
    Apply property updates from Excel file to GitHub repositories.

    Only processes repos with valid CMDB CI numbers to ensure
    data quality and prevent accidental overwrites.
    """
    if not filename:
        raise ValueError("filename is required")

    repo_df = pd.read_excel(filename)

    for _, row in repo_df.iterrows():
        # Safety check: only update repos with valid CI numbers to prevent data corruption
        if row["ci"] and isinstance(row["ci"], str) and re.match(ci_pattern, row["ci"]):
            logger.info(f"Checking if {row['org']}/{row['name']} needs to be updated...")
            repo = gh.get_repo(f"{row['org']}/{row['name']}")
            logger.info(f"Found repo {repo.id}...")

            has_changes = False
            props = repo.get_custom_properties()

            # Only update properties that have actually changed to minimize API calls
            if row["ci"] and row["ci"] != props.get(ci_prop) and re.match(ci_pattern, row["ci"]):
                has_changes = True
                props[ci_prop] = row["ci"]

            if row["email"] and row["email"] != props.get(email_prop):
                has_changes = True
                props[email_prop] = row["email"]

            if row["cost_center"] and row["cost_center"] != props.get(cost_center_prop):
                has_changes = True
                props[cost_center_prop] = row["cost_center"]

            if has_changes:
                logger.info(f"Updating {row['org']}/{row['name']}...")
                repo.update_custom_properties(props)
                logger.info(f"Updated {row['org']}/{row['name']}. Done.")
            else:
                logger.info("Skip repo. Done.")


if __name__ == "__main__":
    app()
```

```sql
SELECT * FROM my_table
WHERE my_column = 'some value'
TIMESTAMP AS OF '2025-07-28T00:00:00Z'
```
