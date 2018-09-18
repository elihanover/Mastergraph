# Terraform Notes
## Basic .tf File Structure

### provider_i.tf (aws, gcloud, etc.)
Each provider will have its own provider file which will Weave will specifically deploy based on command line prompt:
`weave deploy`

### resource_i.tf
We will give each resource its own .tf file, which can have multiple declarations (one for each provider).

### variables.tf
Specify input variables that can be accessed by other .tf files.
``` tf
variable "access_key" {}
variable "secret_key" {}
variable "region" {
  default = "us-east-1"
}
```
Example access:
``` tf
provider "aws" {
  access_key = "${var.access_key}"
  secret_key = "${var.secret_key}"
  region     = "${var.region}"
}
```
### outputs.tf
Specify output variables from the deployment to show to the user.
``` tf
output "address" {
  value = "${aws_instance.db.public_dns}" # required
}
```
Other optional parameters [here](https://www.terraform.io/docs/configuration/outputs.html).
