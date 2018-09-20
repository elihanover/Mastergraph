variable "aws_region" {
  description = "The AWS region to create things in."
  default     = "us-east-1"
}


provider "aws" {
  region = "${var.aws_region}"
}


provider "archive" {
}


data "aws_iam_policy_document" "policy" {
  statement = {
    sid        = ""
    effect     = "Allow"
    principals = {
      identifiers = ["lambda.amazonaws.com"]
      type        = "Service"
    }
    actions    = ["sts:AssumeRole"]
  }
}




