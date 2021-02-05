$RUNNER_TEMP/v2ray/v2ray > $RUNNER_TEMP/v2ray.log &
while ! grep -Fq "started" $RUNNER_TEMP/v2ray.log
do
  sleep 2 # or less like 0.2
done
echo "v2ray started"
