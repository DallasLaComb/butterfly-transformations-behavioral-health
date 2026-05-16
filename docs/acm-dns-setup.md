# ACM Certificate & DNS Setup

Domain: `butterflytransformations.health` (registered on NameCheap)

---

## Step 1 — Request the ACM Certificate

> ACM certificates for CloudFront **must** be in `us-east-1` regardless of where anything else lives.

1. Go to **AWS Certificate Manager → us-east-1 region → Request certificate**
2. Choose **Request a public certificate**
3. Add both domain names:
   - `butterflytransformations.health`
   - `www.butterflytransformations.health`
4. Validation method: **DNS validation**
5. Submit

ACM will display two CNAME records to prove domain ownership.

---

## Step 2 — Validate via NameCheap DNS

In NameCheap → **Advanced DNS** for `butterflytransformations.health`, add the two CNAMEs ACM provides. They look like:

| Type | Host | Value |
|---|---|---|
| CNAME | `_abc123` | `_xyz456.acm-validations.aws.` |
| CNAME | `_abc123.www` | `_xyz456.acm-validations.aws.` |

> **Important:** Strip the root domain from the Host field — NameCheap appends it automatically.
> So `_abc123.butterflytransformations.health` becomes just `_abc123`.

ACM status will change to **Issued** within a few minutes once the CNAMEs propagate.

---

## Step 3 — Add the Cert ARN to SAM Config

Once the cert is issued, copy the ARN from ACM (looks like `arn:aws:acm:us-east-1:121416078382:certificate/xxxx-xxxx`).

Open `infrastructure/samconfig.toml` and replace `PASTE_CERT_ARN_HERE` with the ARN:

```toml
parameter_overrides = "DomainName=butterflytransformations.health AcmCertificateArn=arn:aws:acm:us-east-1:121416078382:certificate/xxxx-xxxx"
```

Push to `master` — the CD pipeline will run `sam deploy` and attach the cert to CloudFront.

---

## Step 4 — Point NameCheap DNS to CloudFront

After the stack deploys, get the CloudFront domain from the stack output:

```bash
aws cloudformation describe-stacks \
  --stack-name butterfly-transformations \
  --query "Stacks[0].Outputs[?OutputKey=='DistributionDomain'].OutputValue" \
  --output text
```

It will look like `d1abc123.cloudfront.net`. Add these records in NameCheap **Advanced DNS**:

| Type | Host | Value |
|---|---|---|
| ALIAS | `@` | `d1abc123.cloudfront.net` |
| CNAME | `www` | `d1abc123.cloudfront.net` |

> Use **ALIAS** for the apex (`@`) — bare CNAMEs on a root domain are not allowed by the DNS spec. NameCheap supports ALIAS records for this purpose.

---

## Order of Operations

1. Request ACM cert
2. Add validation CNAMEs to NameCheap → wait for **Issued**
3. Paste cert ARN into `infrastructure/samconfig.toml`
4. Push to `master` → pipeline deploys CloudFront with the cert and custom domain aliases
5. Copy `DistributionDomain` from stack outputs → add ALIAS/CNAME records in NameCheap
