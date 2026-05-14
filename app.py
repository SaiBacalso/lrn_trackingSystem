from flask import Flask, redirect, render_template, request, send_from_directory

app = Flask(__name__)

@app.route("/")
def home():
    return redirect("/login")

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        return redirect("/dashboard")

    return render_template("index.html")

@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")

@app.route("/lis-upload")
def lis_upload():
    return render_template("lis_upload.html")

@app.route("/students")
def students():
    return render_template("records_page.html")

@app.route("/cohort-tracking")
def cohort_tracking():
    return render_template("co_tracking.html")

@app.route("/reports")
def reports():
    return render_template("reports.html")

@app.route("/computations")
def computations():
    return redirect("/reports")

@app.route("/users")
def users():
    return redirect("/dashboard")

@app.route("/templates/<path:filename>")
def template_assets(filename):
    return send_from_directory("templates", filename)

@app.route("/rsc/<path:filename>")
def resources(filename):
    return send_from_directory("rsc", filename)

if __name__ == "__main__":
    app.run(debug=True)
