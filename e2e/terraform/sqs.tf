resource "aws_sqs_queue" "queue" {
  name = "test-queue"
  tags = {
    github = "https://github.com/zpratt/infra-diff.git"
    random = 1234
  }
}
