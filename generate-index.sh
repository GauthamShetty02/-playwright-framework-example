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
        historical_html="$historical_html    <a href=\"$dir/index.html\" class=\"report-link\">📈 $dir</a>\n"
    fi
done

if [ $(ls -1d build-* 2>/dev/null | wc -l) -eq 0 ]; then
    historical_html="    <p class=\"no-reports\">No historical reports yet. Run more tests to see history.</p>"
fi

# Replace placeholders
echo "$template" | sed "s/{{BUILD_NUMBER}}/$BUILD_NUMBER/g" | sed "s|{{HISTORICAL_REPORTS}}|$historical_html|g" > index.html