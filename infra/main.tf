terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.48"
    }
    vercel = {
      source  = "vercel/vercel"
      version = "~> 0.4"
    }
    shell = {
      source  = "scottwinkler/shell"
      version = "~> 1.7"
    }
  }
}

provider "aws" {
  endpoints {
    dynamodb = var.aws_dynamodb_endpoint == "" ? null : var.aws_dynamodb_endpoint
    iam      = var.aws_iam_endpoint == "" ? null : var.aws_iam_endpoint
    sts      = var.aws_sts_endpoint == "" ? null : var.aws_sts_endpoint
  }
}

provider "vercel" {
  // If we don't have a token, use a fake one that passes validation
  api_token = var.vercel_api_token == "" ? "000000000000000000000000" : var.vercel_api_token
}

module "vercel_auth" {
  source                   = "./modules/vercel_auth"
  count                    = var.vercel_api_token == "" ? 0 : 1
  vercel_api_token         = var.vercel_api_token
  aws_access_key_id        = aws_iam_access_key.auth_api.id
  aws_secret_access_key    = aws_iam_access_key.auth_api.secret
  //noinspection HILUnresolvedReference
  alexa_client_secret_hash = shell_script.alexa_client_secret_hashed.output["hash"]
}
