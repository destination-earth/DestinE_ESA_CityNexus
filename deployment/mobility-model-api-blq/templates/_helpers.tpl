{{/*
Expand the name of the chart.
*/}}
{{- define "mobility-api-blq.name" -}}
{{- default .Chart.Name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "mobility-api-blq.fullname" -}}
{{- $name := default .Chart.Name }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "mobility-api-blq.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "mobility-api-blq.labels" -}}
app.kubernetes.io/name: {{ include "mobility-api-blq.name" . }}
helm.sh/chart: {{ include "mobility-api-blq.chart" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Name of the mobility-api service
*/}}
{{- define "mobility-api-blq.serviceName" -}}
{{ include "mobility-api-blq.name" . }}-service
{{- end -}}

{{/*
Create the name of the service account to use
*/}}
{{- define "mobility-api-blq.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "mobility-api-blq.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}