#!/bin/bash

BUILD_NUMBER=$1
DEPLOY_PATH=$2

cd $DEPLOY_PATH

# Read template
template=$(cat index-template.html)

# Generate historical reports HTML
historical_html=""
for dir in $(ls -1t | grep "^build-" 2>/dev/null || echo ""); do
    if [ -d "$dir" ] && [ "$dir" != "" ] && [[ "$dir" != *"$BUILD_NUMBER-"* ]]; then
        # Extract build number and timestamp from folder name
        build_num=$(echo $dir | cut -d'-' -f2)
        timestamp=$(echo $dir | cut -d'-' -f3- | tr '_' ' ' | tr '-' '/')
        historical_html="$historical_html                <a href=\"$dir/index.html\" class=\"report-link historical-link\">\n"
        historical_html="$historical_html                    📈 Build $build_num\n"
        historical_html="$historical_html                    <div class=\"timestamp\">$timestamp</div>\n"
        historical_html="$historical_html                </a>\n"
    fi
done

if [ $(ls -1d build-* 2>/dev/null | wc -l) -eq 0 ]; then
    historical_html="                <div class=\"no-reports\">\n                    📋 No historical reports yet<br>\n                    <small>Run more tests to see build history</small>\n                </div>"
fi

# Replace placeholders
echo "$template" | sed "s/{{BUILD_NUMBER}}/$BUILD_NUMBER/g" | sed "s|{{HISTORICAL_REPORTS}}|$historical_html|g" > index.html