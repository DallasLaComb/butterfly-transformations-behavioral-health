# AWS CLI SSO Login

SSO portal: `https://daltime.awsapps.com/start`
Account ID: `121416078382`
Profile name: `butterfly`

---

## Login

```bash
aws sso login --profile butterfly
```

This opens a browser tab to approve the session. After approving, return to the terminal — you're authenticated for ~8 hours.

## Verify

```bash
aws sts get-caller-identity --profile butterfly
```

## Set as default for the session

To avoid typing `--profile butterfly` on every command:

```bash
export AWS_PROFILE=butterfly
```

---

## Profile config (already in `~/.aws/config`)

```ini
[sso-session daltime]
sso_start_url = https://daltime.awsapps.com/start
sso_region = us-east-1
sso_registration_scopes = sso:account:access

[profile butterfly]
sso_session = daltime
sso_account_id = 121416078382
sso_role_name = AdministratorAccess
region = us-east-1
output = json
```
