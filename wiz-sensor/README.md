# wiz-sensor

Starts the [Wiz runner sensor](https://docs.wiz.io/docs/github-runner-sensor#git-hub-hosted-runners) on Linux GitHub-hosted runners.

The sensor starts only when all of these hold, otherwise the action logs why it skipped and does nothing:

- the runner is Linux and GitHub-hosted (self-hosted, macOS and Windows runners are skipped)
- the event is not `pull_request_target`
- `enabled` is the string `true` (pass the org variable `WIZ_SENSOR_ENABLED`)
- `token` is not empty (pass the org secret `WIZ_SENSOR_TOKEN`)

A sensor failure never fails the job. Setting `WIZ_SENSOR_ENABLED` to `false` turns the sensor off everywhere without touching workflows.

## Usage

Reference the action by commit SHA and make it the **first step** of the job, so it covers the whole job:

```yaml
steps:
  - name: Wiz sensor
    uses: Consensys/github-actions/wiz-sensor@<commit sha>
    with:
      enabled: ${{ vars.WIZ_SENSOR_ENABLED }}
      token: ${{ secrets.WIZ_SENSOR_TOKEN }}
```

## Security notes

- Pass `WIZ_SENSOR_TOKEN` only to this action, never into a `run` step, and never into a job that runs pull-request-controlled code. The action refuses to start on `pull_request_target`.
- The token must be **single-line JSON**. A pretty-printed token makes GitHub mask `{` and `}`, which silently drops any job output containing them (for example build matrices). Do not pass the token into jobs whose outputs are JSON.
- GitHub masks the whole token secret but not the fields parsed from it. The action registers `registry-username`, `registry-password`, `wiz-api-client-id` and `wiz-api-client-secret` as masks before the Wiz action runs, and does not start the sensor if that fails.
- Do not call this action through a local path (`./.github/actions/...`) from this repository's own pull-request workflows with the token. That path is loaded from the pull request.
- The Wiz action is pinned by commit SHA. Re-review the change if a newer commit is used.
