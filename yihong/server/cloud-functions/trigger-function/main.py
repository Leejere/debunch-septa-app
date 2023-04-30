import requests
import time

def trigger_function(request):
    print('Trigger function started.')
    duration = 900  # run for 900 seconds
    start_time = time.time()
    while time.time() - start_time < duration:
        try:
            response = requests.post('https://us-east1-musa-cloud-computing.cloudfunctions.net/cache-transit-view')
            data = response.json()
            print(data)
        except Exception as e:
            print(e)
        time.sleep(10)  # 10 seconds
    print('Trigger function stopped.')
    return 'Function ran for {} seconds.'.format(duration)