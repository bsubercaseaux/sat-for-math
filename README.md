# Website for SAT in Mathematics


Fork of the [Algorithms with Predictions](https://algorithms-with-predictions.github.io/) project.

# Deployment

Just run `yarn deploy`

# Update papers

```
python3 updater.py --match <.yml filename substring>
``` 

Note: the match is case sensitive.

# Add a new paper.

Create a new `.yml` file in the `papers/` directory with the following structure:

```yaml
title: <Paper Title>
```
and then run the updater script to fetch the metadata from arXiv and DBLP.
